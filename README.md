# CDF2FHIR - Cohort-study to FHIR Data Transformation

CDF2FHIR is a TypeScript tool designed to transform cohort-study data into FHIR-compliant data. This tool allows you to specify and test the pairing rules between the cohort-study data and the properties of a given FHIR resource. Once you have defined these rules, you can link them to one or more FHIR-compliant templates. This requires the cohort study data to be previously transformed into the CDF format.

## Features

- Transform cohort-study data into FHIR-compliant data
- Allows the definition of pairing rules between cohort-study data and FHIR resource properties
- Paring rules are specified in independent modules to make them testeable

## Data-harmonization process at-a-glance

0. The input data is pre-processed so it follows the (participant-centered) CDF format. 
1. A new TypeScript project is created, importing the [NPM mydigitwin-cdf2fhir module](https://www.npmjs.com/package/mydigtwin-cdf2fhir).
2. For each resource you want to include on the target FHIR bundle, a module with the corresponding pairing rules is implemented, following a TDD approach. Depending on the resource, this can by done by implementing one of the existing TypeScript interfaces (e.g., Condition, LaboratoryTestResult, Research Subject).
3. You define, in a configuration file, which 'mapping' modules will be used on which FHIR templates. For the modules developed using the provided interfaces, there are already FHIR templates for it.
4. You can launch the transformation process through the CLI using the `cdf2fhir` command installed with the NPM package.

This package includes interfaces and templates to generate resources compliant with the Dutch FHIR-ZIB ([zib-2017](https://zibs.nl/wiki/ZIB_Publicatie_2017(NL))) profile. Adding support to other profiles, or to resources not yet supported, requires the development of the corresponding templates using the [JSONata transformation language](https://jsonata.org/). How to do this, and the tools that support the process, are further descibed in the [developers documentation](https://mydigitwinnl.github.io/CDF2Medmij-Mapping-tool/*)


## Installation

```
npm install mydigitwin-cdf2fhir
```

## Usage

```bash
#Transform a single file, print the ouput to STDOUT
npx mydigitwin-cdf2fhir <config_file> ./fhirvalidation/sampleinputs/input-p1234.json
#Transform a single file, save the output on the given folder
npx mydigitwin-cdf2fhir <config_file> ./fhirvalidation/sampleinputs/input-p1234.json -o /tmp/out
#Transform all the .json files in a given folder, save the output on the given folder
npx mydigitwin-cdf2fhir <config_file> ./fhirvalidation/sampleinputs -o /tmp/out
```



