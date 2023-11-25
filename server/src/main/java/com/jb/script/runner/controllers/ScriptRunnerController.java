package com.jb.script.runner.controllers;

import com.jb.script.runner.models.enums.TypeOfFile;
import com.jb.script.runner.services.ScriptRunnerService;
import com.jb.script.runner.utils.CommandsUtil;
import com.jb.script.runner.utils.exceptions.InvalidFileFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
public class ScriptRunnerController {

    ScriptRunnerService scriptRunnerService;

    public ScriptRunnerController(ScriptRunnerService scriptRunnerService) {
        this.scriptRunnerService = scriptRunnerService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runScript(@RequestParam String type, @RequestParam("file")MultipartFile script) throws IOException, InvalidFileFormat {
        try {
            int code = scriptRunnerService.runScript(script, CommandsUtil.getCommands(TypeOfFile.valueOfLabel(type)));
            return ResponseEntity.ok().body(code);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }


}