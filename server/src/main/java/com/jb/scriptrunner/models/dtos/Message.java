package com.jb.scriptrunner.models.dtos;

import com.jb.scriptrunner.models.enums.TypeOfMessage;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String content;
    private TypeOfMessage typeOfMessage;
}
