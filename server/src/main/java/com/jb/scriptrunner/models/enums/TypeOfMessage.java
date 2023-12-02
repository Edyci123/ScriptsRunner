package com.jb.scriptrunner.models.enums;

public enum TypeOfMessage {

    OUTPUT("OUTPUT"),
    ERROR("ERROR"),
    EXIT_CODE("EXIT_CODE");

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
