package com.jb.scriptrunner.services;

public abstract class ScriptRunnerService {

    public abstract void runScript(String script, String command) throws Exception;

}
