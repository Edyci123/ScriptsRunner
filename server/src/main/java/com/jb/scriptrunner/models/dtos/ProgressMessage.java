package com.jb.scriptrunner.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProgressMessage {
    private long estimatedTimeRemaining;
    private int currentRun;
}
