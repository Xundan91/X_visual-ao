import * as introJs from "intro.js";
import { Step } from "intro.js-react";
import { IntroJs } from "intro.js/src/intro";

export const steps: Step[] = [
    {
        element: '#connect-button',
        intro: 'This is the connect button. Without connecting, we will not be able to create or run processes, so make sure you have connected before proceeding',
    },
    {
        element: '#add-process-button',
        intro: 'Here we can spawn a new process or connect to an existing one. Click on it, lets create a new process',
    },
    {
        element: '#new-process-button',
        intro: 'Select the new process button',
    }
]

export function refresh(step: number) {
    const updateAt = [2, 3]
    if (updateAt.includes(step)) {
        setTimeout(() => tutorial().refresh(true), 100)
    }
}

async function onChange(step: number) {
    console.log('currentStep', step)
    switch (step) {
        case 0:
            break;
        case 1:
            try {
                await window.arweaveWallet.getActiveAddress()
            }
            catch (error) {
                tutorial().previousStep()
                console.log('error', error)
                alert('Please connect your wallet before proceeding')
            }
            break;
        case 2:
            break;
        case 3:
            break;
    }
}

const tutorial = (): IntroJs => introJs.default.instances[0]

export { tutorial, onChange }