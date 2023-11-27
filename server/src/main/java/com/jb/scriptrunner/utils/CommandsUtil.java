package com.jb.script.runner.utils;

import com.jb.script.runner.models.enums.TypeOfFile;
import com.jb.script.runner.utils.exceptions.InvalidFileFormat;

public class CommandsUtil {

    public static String getCommands(TypeOfFile typeOfFile) throws InvalidFileFormat {
        switch (typeOfFile) {
            case KTS -> {
                return "kotlinc -script";
            }
            case SWIFT -> {
                return "/usr/bin/env swift";
            }
            default -> {
                throw new InvalidFileFormat("File format is not valid!");
            }
        }
    }
}
