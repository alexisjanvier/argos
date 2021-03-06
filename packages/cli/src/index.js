const getContainerStats = require('./getContainerStats');
const onStartContainer = require('./onStartContainer');
const exec = require('./exec');
const computeMeasureAverage = require('./computeMeasureAverage');
const getLastRun = require('./getLastRun');

const run = async () => {
    const measureName = process.env.NAME;
    const command = process.env.COMMAND;
    const runQuantity = process.env.RUN_QUANTITY;
    const otherContainers = process.env.OTHER_CONTAINERS ? process.env.OTHER_CONTAINERS.split(',') : [];

    const lastRun = await getLastRun(measureName);

    if (lastRun) {
        console.log(`${lastRun} previous runs detected for measure ${measureName}, adding run to the existing ones.`);
    }

    for (var i = lastRun + 1; i <= lastRun + runQuantity; i++) {
        console.info(`run ${i}:`);

        const measuresStoppers = otherContainers.map(getContainerStats(measureName, i));
        const stopListening = onStartContainer(getContainerStats(measureName, i));
        await exec(command).catch(console.warn);
        stopListening();
        measuresStoppers.map(stop => stop());
    }

    await computeMeasureAverage(measureName);

    console.log(`DONE`);
};

run().catch(console.error);
