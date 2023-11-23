package com.jb.script.runner.services;

import org.springframework.web.multipart.MultipartFile;

public abstract class ScriptRunnerService {

    public abstract int runScript(MultipartFile multipartFile, String command) throws Exception;

}
