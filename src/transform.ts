import fs from 'fs';
import * as afs from 'fs/promises'
import * as path from 'path';
import { MappingTarget, transform } from './mapper'
import {InputSingleton} from './inputSingleton'
import { UnexpectedInputException } from './unexpectedInputException';
import { Command } from "commander";
import { type } from 'os';



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


function printCommandLineArguments(): void {
  console.log('Program parameters details:');
  console.log('Process all the files in a folder (output folder is mandatory):');
  console.log(`npm run transform -- <input folder path> -o <output folder path>`);
  console.log('Process a single file and generate a file with the output in a given folder:');
  console.log(`npm run transform -- <input file path> -o <output folder path>`);
  console.log('Process a single file and print the output on STDOUT:');
  console.log(`npm run transform -- <input file path>`);
}



function processArguments(args: string[]): void {

  const argsCommand = new Command();

  argsCommand
    .name("transform")
    .description("Process input files or folders with a config file")
    .argument("<config_file>", "Path to the config JSON file")
    .argument("<input_path>", "Path to input file or folder")
    .option("-o, --output_folder <path>", "Output folder (optional). If not given, output goes to STDOUT")
    .allowExcessArguments(false)
    .showHelpAfterError(`
      Error: Invalid arguments provided.

      Expected usage examples:
        1) Process all files in a folder (output folder required):
          $ npm run transform -- <config_file> <input folder path> -o <output folder path>

        2) Process a single file and write to output folder:
          $ npm run transform -- <config_file> <input file path> -o <output folder path>

        3) Process a single file and print to STDOUT:
          $ npm run transform -- <config_file> <input file path>
      `);

  argsCommand.action((configFile, inputPath, options) => {

    console.info(`Config path:${configFile}`)
    console.info(`Input file:${inputPath}`)
    console.info(`Optional:${options.output_folder}`)

    let a = 1/0;

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
          console.error(`Error: Invalid or non existing output folder ${options.output_folder}`);
        }
      }
    }
    });

  argsCommand.parse();



  // if (args.length <= 1) {
  //   printCommandLineArguments()
  //   return;
  // }

  // let folderPath: string | null = null;
  // let filePath: string | null = null;
  // let outputFolder: string | null = null;
  // let targetConfigPath: string | null = null;

  // if (args.length === 1) {
  //   const arg = args[0];
  //   if (validateFolderExistence(arg)) {
  //     console.error('Error: a folder path was given as an input, but the output folder is missing (-o option followed by the output folder)');
  //     return;
  //   } else if (validateFileExistence(arg)) {
  //     filePath = path.resolve(arg)
  //     inputFileToStdout(filePath, targets);
  //   } else {
  //     console.error(`Error: the path or folder given as an input does not exist: '${arg}'`);
  //     return;
  //   }
  // }
  // else if (args.length === 3) {
  //   const arg1 = args[0];
  //   const arg2 = args[1];
  //   const arg3 = args[2];

  //   if (arg2 === '-o') {
  //     if (validateFolderExistence(arg1) && validateFolderExistence(arg3)) {
  //       folderPath = path.resolve(arg1);
  //       outputFolder = path.resolve(arg3);
  //       inputFolderToOutputFolder(folderPath, outputFolder, targets);
  //     } else if (validateFileExistence(arg1) && validateFolderExistence(arg3)) {
  //       filePath = path.resolve(arg1);
  //       outputFolder = path.resolve(arg3);
  //       inputFileToFolder(filePath, outputFolder, targets);
  //     } else {
  //       console.error(`Error: Invalid or non existing input/output paths. Input: ${arg1}, Output: ${arg3}`);
  //       return;
  //     }
  //   } else {
  //     console.error('Error: Invalid arguments');
  //     printCommandLineArguments();
  //     return;
  //   }
  // } else {
  //   console.error('Error: Invalid command');
  //   printCommandLineArguments()
  //   return;
  // }
}

// Get command line arguments
const args: string[] = process.argv.slice(2);
processArguments(args);




