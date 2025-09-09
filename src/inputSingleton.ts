import { Mutex } from 'async-mutex';
import { transformVariables, variableAssessments } from './functionsCatalog'
import { ParticipantUniqueIdentifier } from './transformationConfig'

export class InputSingleton {
  private static instance: InputSingleton;

  private uniqueIdentifier: ParticipantUniqueIdentifier|undefined = undefined;

  private input!: transformVariables;
  
  private mutex: Mutex;

  private constructor() {
    // initialize singleton instance
    this.mutex = new Mutex();
  }

  /**
   * To be set only once
   * @param identifier 
   */
  public setUniqueIdentifierVariable(identifier: ParticipantUniqueIdentifier){
    this.uniqueIdentifier = identifier;
  }

  public getUniqueIdentifier(): ParticipantUniqueIdentifier | undefined{
    return this.uniqueIdentifier;
  }

  public setInput(input: transformVariables) {

    //replace empty spaces in the input data with 'undefined'
    for (const variable in input) {
      for (const assessment in input[variable]) {
        if (input[variable][assessment]?.trim() === '') input[variable][assessment] = undefined
      }
    }
    this.input = input;
  }

  public getInput(varName: string): variableAssessments {
    return this.input[varName];
  }

  public getMutex(): Mutex {
    return this.mutex;
  }


  public static getInstance(): InputSingleton {
    if (!InputSingleton.instance) {
      InputSingleton.instance = new InputSingleton();
    }
    return InputSingleton.instance;
  }


}
