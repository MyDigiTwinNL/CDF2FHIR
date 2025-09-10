import * as path from 'path';
import fs from 'fs';


export type MappingTarget = {
    template: string;
    module: string;
}


export type ParticipantUniqueIdentifier = {
    variableName: string;
    assessmentName: string;
}


export type MappingConfig = {
    participantUniqueIdentifier: ParticipantUniqueIdentifier;
    mappings: MappingTarget[];
}

export function loadConfig(filePath: string): MappingConfig {
    const absPath = path.resolve(filePath);
    const fileContents = fs.readFileSync(absPath, "utf-8");
    return JSON.parse(fileContents) as MappingConfig;
}

