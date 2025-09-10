import { exec } from 'child_process';
import { MappingTarget } from '../transformationConfig';
import { transform} from '../mapper';
import fs from 'fs';


  const output = "";
  const targets: MappingTarget[] = [
    { "template": '../zib-2017-mappings/LDLCholesterol_Diagnostic_Report.jsonata', "module": './__testmappings__/LDLCholesterol'},
    { "template": '../zib-2017-mappings/LDLCholesterol_Observation.jsonata', "module": './__testmappings__/LDLCholesterol'},
    { "template": '../zib-2017-mappings/LDLCholesterol_Specimen.jsonata', "module": './__testmappings__/LDLCholesterol' }
  ];

  const input = {
    "project_pseudo_id": { "1a": "520681571" },
    "variant_id": {},
    "date": {"1a":"1992-5","1b":"1995-5","1c":"1997-5","2a":"2001-5","3a":"2003-5","3b":"2005-5"},
    "age": { "1a": "22" },
    "hdlchol_result_all_m_1": { "1a": "0.31", "2a": "0.32" },
    "ldlchol_result_all_m_1": { "1a": "0.41", "2a": "0.42" },
  };

  const transformedOutput = transform(input, targets).then((bundle) => {
    const outputPath = "/tmp/output.json"
    fs.writeFileSync(outputPath, JSON.stringify(bundle));
    console.info("RUNNING HL7 validator")
    const command = `java -jar /Users/hcadavid/eScience/MyDigiTwin/MedMij-Profile-validator/validator_cli.jar ${outputPath} -version 3.0.2 -ig nictiz.fhir.nl.stu3.zib2017#2.2.8 -sct nl -output-style compact -tx n/a`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running the JAR file: ${error.message}`);
        process.exit(1);
      }
      else{
        console.error(`HL7 validation success: error code 0`);
      }

      
            
    });


  }
  );

  