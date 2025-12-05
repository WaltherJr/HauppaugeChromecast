package com.eriksandsten.hauppaugechromecast.repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class JsonRepositoryOld {
    private final ObjectMapper objectMapper = new ObjectMapper();
    final Path databasePath;

    public JsonRepositoryOld(String databaseFile) {
        databasePath = Path.of(databaseFile);
    }

    public synchronized JsonNode getValueFromKey(String key) {
        try {
            final JsonNode root = objectMapper.readTree(databasePath.toFile());
            JsonPath node = getByPath(root, key);
            return node != null && node.currentNode != null ? node.currentNode : null;

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public synchronized String setValueByKey(String key, String value) {
        try {
            final JsonNode root = objectMapper.readTree(databasePath.toFile());
            final JsonPath node = getByPath(root, key);

            // Cast to ObjectNode to allow modifications
            if (node != null && node.previousNode.isObject()) {
                final ObjectNode objectNode = (ObjectNode) node.previousNode;
                final String oldValue = objectNode.get(key).asText();
                objectNode.put(key, value);
                Files.writeString(databasePath, root.toPrettyString(), StandardOpenOption.CREATE, StandardOpenOption.WRITE);

                return oldValue;

            } else {
                throw new IllegalArgumentException();
            }
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private JsonPath getByPath(JsonNode node, String path) {
        final String[] parts = path.split("\\.");
        JsonNode currentNode = node;
        JsonNode previousNode = currentNode;

        for (String part : parts) {
            if (currentNode == null) {
                return null;
            } else {
                previousNode = currentNode;
                currentNode = currentNode.path(part);
            }
        }

        return new JsonPath(parts, currentNode, previousNode);
    }

    private record JsonPath(String[] pathSegments, JsonNode currentNode, JsonNode previousNode) {}
}
