package com.jb.scriptrunner.controllers;

import com.jb.scriptrunner.models.dtos.Script;
import com.jb.scriptrunner.models.enums.TypeOfFile;
import com.jb.scriptrunner.services.ScriptRunnerService;
import com.jb.scriptrunner.utils.CommandsUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ScriptRunnerController {

    private final ScriptRunnerService scriptRunnerService;

    public ScriptRunnerController(ScriptRunnerService scriptRunnerService) {
        this.scriptRunnerService = scriptRunnerService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runScript(@RequestParam String type, @RequestBody Script script) {
        try {
            scriptRunnerService.runScript(script.getScriptContent(), CommandsUtil.getCommands(TypeOfFile.valueOfLabel(type)));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


}
