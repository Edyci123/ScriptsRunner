package com.jb.scriptrunner.services;

import com.jb.scriptrunner.models.dtos.ScriptRunResponse;

public abstract class ScriptRunnerService {

    public abstract ScriptRunResponse runScript(String script, String command) throws Exception;

}
