import prettyFormat from 'pretty-format';
import isEqual from 'lodash.isequal';

async function test(label, fn) {
    const errors = [];
    let passed = 0;
    const promises = [];
    const buildComparator = (eq, message) => async (...params) => {
        const p = new Promise(async resolve => {
            const resolveParams = await Promise.all(params);
            if (!eq(...resolveParams)) {
                errors.push(message(...resolveParams));
            } else {
                passed++;
            }
            resolve();
        });
        promises.push(p);
    };
    const formatLabel = label => label ? `${label}: ` : '';
    const defaultMessage = (a, b, label = '') =>
        `${formatLabel(label)}${prettyFormat(a)} != ${prettyFormat(b)}`;
    let plannedAmount = null;
    const t = {
        plan: (count) => plannedAmount = count,
        truthy: buildComparator(a => !!a, (a, label) => `${formatLabel(label)}${a} is not truthy`),
        falsy: buildComparator(
            a => !a,
            (a, label) => `${formatLabel(label)}${prettyFormat(a)} is not falsey`
        ),
        is: buildComparator((a, b) => a === b, defaultMessage),
        deepEqual: buildComparator(isEqual, defaultMessage),
        wait(desc, f, timeout = 5000) {
            const p = new Promise((resolve, reject) => {
                f(resolve, reject);
                setTimeout(() => reject(new Error(desc + ': Timeout')), timeout);
            });
            promises.push(p);
            return p;
        },
        async delay(timeout = 500) {
            return new Promise(resolve => setTimeout(resolve, timeout));
        },
    };
    try {
        await Promise.race([
            fn(t),
            new Promise((_, reject) => setTimeout(
                () => reject(new Error('Timeout reached')),
                15000
            )),
        ]);
        const assertionCount = passed + errors.length;
        if (plannedAmount !== null && plannedAmount !== (assertionCount)) {
            errors.push(`Planned for ${plannedAmount} assertions; received ${assertionCount}`);
        }
        await Promise.race([
            Promise.all(promises),
            new Promise((_, reject) => setTimeout(
                () => reject(new Error('Timeout reached')),
                15000
            )),
        ]);
    } catch (e) {
        errors.push('Uncaught exception: ' + e.message);
    }
    return { label, passed, errors };
}

export default function suite(makeTests) {
    const tests = [];
    makeTests((...params) => tests.push(test.bind(null, ...params)));

    return async function runSuite() {
        const results = [];
        for (const test of tests) {
            results.push(await test());
        }
        return results;
    }
}
