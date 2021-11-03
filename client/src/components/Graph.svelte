<script>
    import Line from "svelte-chartjs/src/Line.svelte";
    import 'chartjs-adapter-moment';

    import { onMount, afterUpdate } from 'svelte';

    let dataLine = {
            datasets: [{
                borderColor: "rgb(255, 0, 0)",
                borderWidth: 1,
                data: [],
                label: "ON Period",
                radius: 0,
                fill: true,
                backgroundColor: "rgba(255, 0, 0, 0.7)",
                stepped: true
            }]
        };

    $: dataLine.datasets[0].data = pointData;

    let options = {
        animation: false,
        parsing: false,
        responsive: true,
        mantainAspectRatio: false,
        spanGaps: 3600 * 1000,
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        plugins: {
            decimation: {
                enabled: true,
                algorithm: 'min-max',
            }
        },
        scales: {
            x: {
                type: 'time',
                min: Date.now() - 3600*1000,
                max: Date.now()
            },
            y: {
                type: 'category',
                labels: ['ON', 'OFF'],
                min: 0,
                max: 1
            }
        }
    };

    let calculateLabel = (millis) => {
        let time = "";

        let days = Math.floor(millis / (24 * 3600 * 1000));
        let hours = Math.floor(millis / (3600 * 1000)) % 24;
        let minutes = Math.floor(millis / (60 * 1000)) % 60;
        let seconds = Math.floor(millis / 1000) % 60;
        let ms = millis % 1000;

        let hasGreaterSetted = false;
        if(days>0){ time += days+"d "; hasGreaterSetted = true};
        if(hours>0 || hasGreaterSetted){ time += hours+"h "; hasGreaterSetted = true; }
        if(minutes>0 || hasGreaterSetted){ time += minutes+"m "; hasGreaterSetted = true; }
        if(seconds>0 || hasGreaterSetted){ time += seconds+"s "; hasGreaterSetted = true; }
        if(ms>0 || hasGreaterSetted) time += ms+"ms ";
        
        return time;
    }

    let updateChart = ()=>{
        dataLine.datasets[0].data = pointData;
        dataLine.datasets[0].label = calculateLabel(elapsedOnTime);

        options.scales.x.min = Date.now() - timeSpan;
        options.scales.x.max = Date.now();

        dataLine = dataLine;
        options = options;
    };

    onMount(updateChart);
    afterUpdate(updateChart);

    export let pointData;
    export let timeSpan;
    export let elapsedOnTime;
</script>

<Line data={dataLine} {options} style="max-height: 70vh;"/>
