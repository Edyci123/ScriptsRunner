package com.jb.scriptrunner.services;

import java.util.UUID;

public abstract class ScriptRunnerService {

    public abstract UUID runScript(String script, String command) throws Exception;

}
