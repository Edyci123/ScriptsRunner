package com.jb.scriptrunner.utils;

import com.jb.scriptrunner.models.enums.TypeOfFile;
import com.jb.scriptrunner.utils.exceptions.InvalidFileFormat;

public class CommandsUtil {

    public static String getCommands(TypeOfFile typeOfFile) throws InvalidFileFormat {
        String os = System.getProperty("os.name").toLowerCase();
        switch (typeOfFile) {
            case KTS -> {
                if (os.contains("win")) {
                    return "cmd /c kotlinc -script";
                } else {
                    return "kotlinc -script";
                }
            }
            case SWIFT -> {
                return "/usr/bin/env swift";
            }
            default -> {
                throw new InvalidFileFormat("File format is not valid!");
            }
        }
    }
}
