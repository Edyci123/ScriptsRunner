package com.jb.scriptrunner.controllers;

import com.jb.scriptrunner.models.dtos.FileUUIDResponse;
import com.jb.scriptrunner.models.dtos.Script;
import com.jb.scriptrunner.models.enums.TypeOfFile;
import com.jb.scriptrunner.services.ScriptRunnerService;
import com.jb.scriptrunner.utils.CommandsUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@CrossOrigin
@RestController
public class ScriptRunnerController {

    private final ScriptRunnerService scriptRunnerService;

    public ScriptRunnerController(ScriptRunnerService scriptRunnerService) {
        this.scriptRunnerService = scriptRunnerService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runScript(@RequestParam String type, @RequestBody Script script) {
        try {
            UUID uuid = scriptRunnerService.runScript(script.getScriptContent(), CommandsUtil.getCommands(TypeOfFile.valueOfLabel(type)));
            return ResponseEntity.ok().body(new FileUUIDResponse(uuid));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


}
