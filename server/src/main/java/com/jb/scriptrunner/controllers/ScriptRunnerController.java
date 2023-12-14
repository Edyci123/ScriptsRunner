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
            System.out.println(scriptRunRequest.getUuid());
            ScriptRunResponse scriptRunResponse = scriptRunnerService.runScript(scriptRunRequest.getUuid(), scriptRunRequest.getScriptContent(), CommandsUtil.getCommands(TypeOfFile.valueOfLabel(type)));
            return ResponseEntity.ok().body(scriptRunResponse);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
