package com.jb.scriptrunner.controllers;

import com.jb.scriptrunner.models.dtos.ScriptRunRequest;
import com.jb.scriptrunner.models.dtos.ScriptRunResponse;
import com.jb.scriptrunner.models.enums.TypeOfFile;
import com.jb.scriptrunner.services.ScriptRunnerService;
import com.jb.scriptrunner.utils.CommandsUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
public class ScriptRunnerController {

    private final ScriptRunnerService scriptRunnerService;

    public ScriptRunnerController(ScriptRunnerService scriptRunnerService) {
        this.scriptRunnerService = scriptRunnerService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runScript(@RequestParam String type, @RequestBody ScriptRunRequest scriptRunRequest) {
        try {
            ScriptRunResponse scriptRunResponse = scriptRunnerService.runScript(
                    scriptRunRequest.getUuid(), scriptRunRequest.getScriptContent(),
                    CommandsUtil.getCommands(TypeOfFile.valueOfLabel(type)));
            return ResponseEntity.ok().body(scriptRunResponse);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/run/multiple")
    public ResponseEntity<?> runScriptMultipleTimes
            (@RequestParam String type, @RequestParam int count, @RequestBody ScriptRunRequest scriptRunRequest, @RequestParam boolean fullOutput) {
        try {
            scriptRunnerService.runMultipleTimes(
                    scriptRunRequest.getUuid(), scriptRunRequest.getScriptContent(),
                    CommandsUtil.getCommands(TypeOfFile.valueOfLabel(type)), count, fullOutput);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
