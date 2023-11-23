package com.jb.script.runner.models.enums;

import com.jb.script.runner.utils.exceptions.InvalidFileFormat;

public enum TypeOfFile {
    KTS("KTS"),
    SWIFT("SWIFT");

    public final String label;

    private TypeOfFile(String label) {
        this.label = label;
    }

    public static TypeOfFile valueOfLabel(String label) throws InvalidFileFormat {
        for (TypeOfFile e : values()) {
            if (e.label.equals(label)) {
                return e;
            }
        }
        throw new InvalidFileFormat("File format is not valid!");
    }
}
