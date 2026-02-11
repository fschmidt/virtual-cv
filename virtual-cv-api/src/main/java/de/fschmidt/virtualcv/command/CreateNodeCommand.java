package de.fschmidt.virtualcv.command;

public sealed interface CreateNodeCommand permits
        CreateProfileCommand,
        CreateCategoryCommand,
        CreateItemCommand,
        CreateSkillGroupCommand,
        CreateSkillCommand {

    String id();
    String parentId();
    String label();
    String markdownContent();
    Integer positionX();
    Integer positionY();
}
