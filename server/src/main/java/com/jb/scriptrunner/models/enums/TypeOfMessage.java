package com.jb.scriptrunner.models.enums;

public enum TypeOfMessage {

    OUTPUT("OUTPUT"),
    ERROR("ERROR"),
    EXIT_CODE("EXIT_CODE"),
    EXECUTION_TIME("EXECUTION_TIME");

    public final String label;

    private TypeOfMessage(String label) {
        this.label = label;
    }

    public static TypeOfMessage valueOfLabel(String label) {
        for (TypeOfMessage e : values()) {
            if (e.label.equals(label)) {
                return e;
            }
        }
        return null;
    }
}
