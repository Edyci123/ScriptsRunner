package com.jb.scriptrunner.services;

import org.springframework.web.multipart.MultipartFile;

public abstract class ScriptRunnerService {

    public abstract void runScript(MultipartFile multipartFile, String command) throws Exception;

}
