package com.jb.scriptrunner.controllers;

import com.jb.scriptrunner.models.enums.TypeOfFile;
import com.jb.scriptrunner.services.ScriptRunnerService;
import com.jb.scriptrunner.utils.CommandsUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class ScriptRunnerController {

    private final ScriptRunnerService scriptRunnerService;


    public ScriptRunnerController(ScriptRunnerService scriptRunnerService) {
        this.scriptRunnerService = scriptRunnerService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runScript(@RequestParam String type, @RequestParam("file")MultipartFile script) {
        try {
            scriptRunnerService.runScript(script, CommandsUtil.getCommands(TypeOfFile.valueOfLabel(type)));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


}
