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
    String description();
    Integer positionX();
    Integer positionY();
}
