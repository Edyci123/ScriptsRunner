package com.jb.scriptrunner.services;

import com.jb.scriptrunner.models.dtos.Message;
import com.jb.scriptrunner.models.dtos.ProgressMessage;
import com.jb.scriptrunner.models.dtos.ScriptRunResponse;
import com.jb.scriptrunner.models.enums.TypeOfMessage;
import com.jb.scriptrunner.utils.RunEstimator;
import com.jb.scriptrunner.utils.TwoSizes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.ArrayList;
import java.util.Scanner;
import java.util.UUID;

@Service
public class ScriptRunnerServiceImpl extends ScriptRunnerService {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final String rootDir = "src/main/resources/";
    private final File template = new File(rootDir + "/ExecTimeTemplate.kts");
    private final RunEstimator runEstimator = new RunEstimator();

    @Autowired
    public ScriptRunnerServiceImpl(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    private void sendMessages(UUID uuid, InputStream inputStream, TypeOfMessage typeOfMessage,
                              int importsLen, int contentLen) {
        try {
            String destinationSocket = "/topic/script-output/" + uuid;
            InputStreamReader errorStreamReader = new InputStreamReader(inputStream);
            BufferedReader bufferedReader = new BufferedReader(errorStreamReader);

            String line;
            int wrongError = 0;
            while ((line = bufferedReader.readLine()) != null) {
                if (wrongError != 0) {
                    wrongError--;
                    continue;
                }
                System.out.println(line);
                if (typeOfMessage.equals(TypeOfMessage.ERROR) && line.contains(uuid.toString())) {
                    String[] splitLine = line.split(":");
                    int errorLine = Integer.parseInt(splitLine[1]);
                    if (errorLine > importsLen) {
                        splitLine[1] = String.valueOf(Integer.parseInt(splitLine[1]) - 1);
                    }
                    if (errorLine == importsLen + 1 || errorLine >= importsLen + 1 + contentLen + 1) {
                        wrongError = 2;
                        continue;
                    }
                    simpMessagingTemplate.convertAndSend(destinationSocket,
                            new Message(String.join(":", splitLine), typeOfMessage));
                    continue;
                }
                if (line.startsWith("EXECTIME")) {
                    simpMessagingTemplate.convertAndSend(destinationSocket,
                            new Message(line.replace("EXECTIME", ""), TypeOfMessage.EXECUTION_TIME));
                    continue;
                }
                simpMessagingTemplate.convertAndSend(destinationSocket, new Message(line, typeOfMessage));
            }
        } catch (IOException e) {
            System.out.println(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private TwoSizes addContentToFile(String script, File file) throws IOException {
        boolean isContent = false;
        ArrayList<String> imports = new ArrayList<>();
        ArrayList<String> content = new ArrayList<>();

        for (String val : script.split("\n")) {
            if (!val.matches("(\\s+)?import(\\s+)?.+(\\s+)?") && !val.matches("(\\s+)?")) {
                isContent = true;
            }

            if (isContent) {
                content.add(val);
            } else {
                imports.add(val);
            }
        }

        ArrayList<String> execTimeScript = new ArrayList<>();

        Scanner reader = new Scanner(template);
        while (reader.hasNextLine()) {
            String data = reader.nextLine();

            if (data.equals("$$$imports$$$")) {
                execTimeScript.add(String.join("\n", imports));
            } else if (data.equals("$$$content$$$")) {
                execTimeScript.add(String.join("\n", content));
            } else {
                execTimeScript.add(data);
            }
        }

        try (OutputStream outputStream = new FileOutputStream(file)) {
            outputStream.write(String.join("\n", execTimeScript).replaceAll("\\u00a0", " ")
                    .getBytes());
        }

        return new TwoSizes(imports.size(), content.size());
    }

    @Override
    public ScriptRunResponse runScript(UUID uuid, String script, String command) throws Exception {
        try {
            File file = new File(rootDir + uuid + ".kts");
            String path = file.getAbsolutePath();
            TwoSizes sizes = addContentToFile(script, file);
            command += " " + path;

            long startTime = System.currentTimeMillis();
            Process process = new ProcessBuilder(command.split("\\s")).start();

            Thread outputThread = new Thread(() -> sendMessages(uuid, process.getInputStream(),
                    TypeOfMessage.OUTPUT, sizes.getFirstSize(), sizes.getSecondSize()));
            Thread errorOutputThread = new Thread(() -> sendMessages(uuid, process.getErrorStream(),
                    TypeOfMessage.ERROR, sizes.getFirstSize(), sizes.getSecondSize()));

            outputThread.start();
            errorOutputThread.start();

            int exitCode = process.waitFor();
            if (file.delete()) {
                System.out.println("File deleted!");
            } else {
                System.out.println("File not deleted!");
            }
            outputThread.join();
            errorOutputThread.join();
            simpMessagingTemplate.convertAndSend("/topic/script-output/" + uuid,
                    new Message(String.valueOf(exitCode), TypeOfMessage.EXIT_CODE));
            return new ScriptRunResponse(uuid, System.currentTimeMillis() - startTime);
        } catch (IOException | InterruptedException e) {
            System.out.println(e.getMessage());
            throw new Exception(e.getMessage());
        }
    }

    @Override
    public void runMultipleTimes(UUID uuid, String script, String command, int count, boolean fullOutput) throws Exception {
        File file = new File(rootDir + uuid + ".kts");
        String path = file.getAbsolutePath();

        TwoSizes sizes = addContentToFile(script, file);

        command += " " + path;

        for (int i = 1; i <= count; i++) {
            long startTime = System.currentTimeMillis();
            Process process = new ProcessBuilder(command.split("\\s")).start();
            if (i == 1 || fullOutput) {
                Thread outputThread = new Thread(() -> sendMessages(uuid, process.getInputStream(),
                        TypeOfMessage.OUTPUT, sizes.getFirstSize(), sizes.getSecondSize()));
                Thread errorOutputThread = new Thread(() -> sendMessages(uuid, process.getErrorStream(),
                        TypeOfMessage.ERROR, sizes.getFirstSize(), sizes.getSecondSize()));

                outputThread.start();
                errorOutputThread.start();

                int exitCode = process.waitFor();

                outputThread.join();
                errorOutputThread.join();
                simpMessagingTemplate.convertAndSend("/topic/script-output/" + uuid,
                        new Message(String.valueOf(exitCode), TypeOfMessage.EXIT_CODE));

                if (exitCode != 0) {
                    if (file.delete()) {
                        System.out.println("File deleted!");
                    } else {
                        System.out.println("File not deleted!");
                    }
                    return;
                }

                long endTime = System.currentTimeMillis();
                long scriptTime = endTime - startTime;
                runEstimator.add(scriptTime, endTime);
                long estimatedTime = runEstimator.getEstimatedTime(count);
                simpMessagingTemplate.convertAndSend("/topic/script-progress/" + uuid, new ProgressMessage(estimatedTime, i));
            } else {
                process.waitFor();
                long endTime = System.currentTimeMillis();
                long scriptTime = endTime - startTime;
                runEstimator.add(scriptTime, endTime);
                long estimatedTime = runEstimator.getEstimatedTime(count);
                simpMessagingTemplate.convertAndSend("/topic/script-progress/" + uuid, new ProgressMessage(estimatedTime, i));
            }
        }
        if (file.delete()) {
            System.out.println("File deleted!");
        } else {
            System.out.println("File not deleted!");
        }

        runEstimator.clear();
    }
}
