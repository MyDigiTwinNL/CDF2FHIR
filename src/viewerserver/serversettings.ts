import { MappingTarget, ParticipantUniqueIdentifier } from '../transformationConfig';


export const idvar:ParticipantUniqueIdentifier = {"assessmentName":"1a","variableName":"project_pseudo_id"}

export const targets:MappingTarget[] = [
    { "template": '../../zib-2017-mappings/Patient.jsonata', "module": './__testmappings__/Patient' },
    { "template": '../../zib-2017-mappings/generic/Condition.jsonata', "module": './__testmappings__/Stroke' },
    { "template": '../../zib-2017-mappings/generic/Condition.jsonata', "module": './__testmappings__/MyocardialInfarction' },
    { "template": '../../zib-2017-mappings/generic/Condition.jsonata', "module": './__testmappings__/HeartFailure' },  
    { "template": '../../zib-2017-mappings/generic/Condition.jsonata', "module": './__testmappings__/CardioVascularDisease' },  
    
  ]
