package com.jb.scriptrunner.services;

import com.jb.scriptrunner.models.dtos.ScriptRunResponse;

import java.util.UUID;

public abstract class ScriptRunnerService {

    public abstract ScriptRunResponse runScript(UUID uuid, String script, String command) throws Exception;

    public abstract void runMultipleTimes(UUID uuid, String script, String command, int count) throws Exception;

}
