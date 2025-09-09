#!/usr/bin/env node

import fs from 'fs';
import * as path from 'path';
import { MappingTarget, transform } from './mapper'
import {InputSingleton} from './inputSingleton'
import { UnexpectedInputException } from './unexpectedInputException';
import { Command } from "commander";



/**
 * //To resolve all relative paths from the 'dist' folder.
 */
const resolveLocalPath = () => {
  const folderPath = path.resolve(__dirname);
  process.chdir(folderPath);
}

const inputFileToStdout = (inputFilePath: string, mappingTargets:MappingTarget[]) => {
  resolveLocalPath();

  /*Transformation performed with a mutex to prevent async race conditions due to the shared variable (InputSingletone)
    between the mapping modules and the JSONata templates. The mutex is released after the transformation is performed
    so the input cannot be changed in the process.*/
  InputSingleton.getInstance().getMutex().acquire().then((releasemutex) => {
    const input = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    transform(input, mappingTargets).then((output) => {
      console.info(JSON.stringify(output));
      releasemutex();
    })

  });

  
}

const inputFileToFolder = async (filePath: string, outputFolder: string, mappingTargets:MappingTarget[]) => {
  //To resolve all relative paths from the 'dist' folder.
  resolveLocalPath();

  await InputSingleton.getInstance().getMutex().acquire();
  
  try {
    const input = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const output = await transform(input, mappingTargets);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath);
    const fileNameWithoutExtension = fileName.replace(fileExtension, '');
    const fhirFileName = `${fileNameWithoutExtension}-fhir${fileExtension}`;
    const outputFilePath = path.join(outputFolder, fhirFileName);

    fs.writeFileSync(outputFilePath, JSON.stringify(output));
  
    console.info(`${filePath} ====> ${outputFilePath}`);

  } finally {
    InputSingleton.getInstance().getMutex().release();
  }

  
}

/**
 * 
 * @param inputFolder 
 * @param outputFolder 
 * @throws 
 */
const inputFolderToOutputFolder = async (inputFolder: string, outputFolder: string, mappingTargets:MappingTarget[]) => {

  const errList:string[] = []
  const errFiles:string[] = []

  const fileNames: string[] = fs.readdirSync(inputFolder);

  for (const fileName of fileNames) {
    console.info(`Processing ${fileName}`);
    const filePath: string = path.join(inputFolder, fileName);
    const fileStats: fs.Stats = fs.statSync(filePath);

    if (fileStats.isFile() && fileName.toLowerCase().endsWith(".json")) {
      try {
        await inputFileToFolder(filePath, outputFolder, mappingTargets);
      } catch (err) {
        if (err instanceof UnexpectedInputException) {
          console.info(`Skipping ${filePath} due to a variable that wasn't expected to be undefined: ${err.message}`);
          errList.push(`Skipping ${filePath} due to a variable that wasn't expected to be undefined: ${err.message}`)
          errFiles.push(`${filePath}`)
        } else {
          console.info(`Aborting transformation due to an error while processing ${filePath}: ${err}`);
          process.exit(1)
        }
      }
    }
  }

  //inputFileToFolder is performed asyncrhonously. Synchronize all the
  //await Promise.all(promises);
  if (errList.length > 0 ){
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:T.-]/g, '_'); 
    const errorLogPath = `/tmp/errors_${timestamp}.txt`; 
    const failedFilesLogPath = `/tmp/failed_files_${timestamp}.txt`; 

    fs.writeFile(errorLogPath,errList.join('\n'),
      (error)=>{
        if (error){
          console.error(`Unable to save error files ${errorLogPath}`)
        }
        else{
          console.log(`Details of files with errors were written on ${errorLogPath}`)
        }
      }
    )

    fs.writeFile(failedFilesLogPath,errFiles.join('\n'),
      (error)=>{
        if (error){
          console.error(`Unable to save error files ${failedFilesLogPath}`)
        }
        else{
          console.log(`The list of files with inconsistencies was written on ${failedFilesLogPath}`)
        }
      }
    )
  }
  else{
    console.info('Finished with no errors')
  }
  

}


// Check if a file exists
const validateFileExistence = (filePath: string): boolean => {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

const validateFolderExistence = (folderPath: string): boolean => {
  try {
    const stats = fs.statSync(folderPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

function loadTargets(filePath: string): MappingTarget[] {
  const absPath = path.resolve(filePath);
  const fileContents = fs.readFileSync(absPath, "utf-8");
  return JSON.parse(fileContents) as MappingTarget[];
}


function processArguments(): void {

  const argsCommand = new Command();

  argsCommand
    .name("cdf2fhir")
    .description("Process input files or folders with a config file")
    .argument("<config_file>", "Path to the config JSON file")
    .argument("<input_path>", "Path to input file or folder")
    .option("-o, --output_folder <path>", "Output folder (optional). If not given, output goes to STDOUT")
    .allowExcessArguments(false)
    .showHelpAfterError(`
      Error: Invalid arguments provided.

      Expected usage examples:
        1) Process all files in a folder (output folder required):
          $ cdf2fhir <config_file> <input folder path> -o <output folder path>

        2) Process a single file and write to output folder:
          $ cdf2fhir <config_file> <input file path> -o <output folder path>

        3) Process a single file and print to STDOUT:
          $ cdf2fhir <config_file> <input file path>
      `);

  argsCommand.action((configFile, inputPath, options) => {

    let targets:MappingTarget[];

    if (validateFileExistence(configFile)){
      targets = loadTargets(configFile);

      //A sigle file as an input, STDOUT as an output
      if (options.output_folder === undefined){
        if (validateFileExistence(inputPath)){
          inputFileToStdout(path.resolve(inputPath), targets);
        }
        else{
          console.error(`Error: Invalid or non existing input path ${inputPath}`);
        }
      }
      //A single file or a folder as an input, a folder as an output
      else{

        if (validateFolderExistence(options.output_folder)){
          if (validateFolderExistence(inputPath)){            
            inputFolderToOutputFolder(path.resolve(inputPath), path.resolve(options.output_folder), targets);
          }
          else if (validateFileExistence(inputPath)){
            inputFileToFolder(path.resolve(inputPath), path.resolve(options.output_folder), targets);
          }
          else{
            console.error(`Error: Invalid or non existing input file/folder ${options.output_folder}`);
          }

        }
        else{
          console.info("b")
          console.error(`Error: Invalid or non existing output folder ${options.output_folder}`);
        }
      }
    }
    else{
      console.error(`Error: Invalid or non existing transformation configuration file ${configFile}`);
    }
    });

  argsCommand.parse();

}

processArguments();




