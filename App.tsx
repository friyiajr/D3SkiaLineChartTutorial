import React from 'react';

import {
  Canvas,
  Path,
  runTiming,
  Skia,
  SkPath,
  useComputedValue,
  useValue,
} from '@shopify/react-native-skia';

import {animatedData, DataPoint, originalData} from './Data';
import {curveBasis, line, scaleLinear, scaleTime} from 'd3';
import {Button, Easing} from 'react-native';

interface GraphData {
  min: number;
  max: number;
  curve: SkPath;
}

const App = () => {
  const transition = useValue(1);
  const state = useValue({
    current: 0,
    next: 1,
  });

  const GRAPH_HEIGHT = 400;
  const GRAPH_WIDTH = 400;

  const makeGraph = (data: DataPoint[]): GraphData => {
    const max = Math.max(...data.map(val => val.value));
    const min = Math.min(...data.map(val => val.value));
    const y = scaleLinear().domain([0, max]).range([GRAPH_HEIGHT, 35]);

    const x = scaleTime()
      .domain([new Date(2000, 1, 1), new Date(2000, 1, 15)])
      .range([10, GRAPH_WIDTH - 10]);

    const curvedLine = line<DataPoint>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.value))
      .curve(curveBasis)(data);

    const skPath = Skia.Path.MakeFromSVGString(curvedLine!);

    return {
      max,
      min,
      curve: skPath!,
    };
  };

  const transitionStart = () => {
    state.current = {
      current: state.current.next,
      next: state.current.current,
    };
    transition.current = 0;
    runTiming(transition, 1, {
      duration: 750,
      easing: Easing.inOut(Easing.cubic),
    });
  };

  const graphData = [makeGraph(originalData), makeGraph(animatedData)];

  const path = useComputedValue(() => {
    const start = graphData[state.current.current].curve;
    const end = graphData[state.current.next].curve;
    return start.interpolate(end, transition.current);
  }, [state, transition]);

  return (
    <>
      <Canvas style={{width: GRAPH_WIDTH, height: GRAPH_HEIGHT}}>
        <Path style="stroke" path={path} strokeWidth={2} />
      </Canvas>
      <Button title="Press Here" onPress={transitionStart} />
    </>
  );
};

export default App;
