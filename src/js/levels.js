let levels = [
  // {
  //   rows: 2,
  //   cols: 2,
  //   colors: [30, 190],
  //   target: 30,
  //   min: 2
  // },
  {
    rows: 10,
    cols: 10,
    colors: [0, 40, 210, 100],
    steps: 10,
    target: 200,
    min: 2,
    bombRadius: 2
  },{
    rows: 10,
    cols: 10,
    colors: [0, 40, 210, 100, 310],
    steps: 15,
    target: 350,
    min: 2,
    superCount: 6
  },{
    rows: 12,
    cols: 12,
    colors: [0, 40, 210, 100],
    steps: 10,
    target: 400,
    min: 3,
    bombRadius: 2,
    superCount: 7
  }
];

export { levels };