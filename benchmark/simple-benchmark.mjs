import { resolve } from 'path'

import { Tinypool } from '../dist/esm/index.js'

import { Bench } from 'tinybench'

const bench = new Bench({
  time: 10_000,
  setup: (task, mode) => {
    task.pool = new Tinypool({
      filename: resolve('benchmark', 'fixtures', 'add.js'),
      isolateWorkers: task.name === 'isolate',
    })
  },
  teardown: async (task) => {
    await task.pool.destroy()
  }
});

console.log('Benchmarking...')

bench
  .add('no isolate', async function () {
    const result = await this.pool.run({ a: 4, b: 6 })

    if (result !== 10) {
      throw new Error(`result not correct: ${result}`)
    }

    return result
  })
  .add('isolate', async function () {
    const result = await this.pool.run({ a: 4, b: 6 })
    
    if (result !== 10) {
      throw new Error(`result not correct: ${result}`)
    }
    
    return result
  });

await bench.run();

console.table(bench.tasks.map(({ name, result }) => ({
  "Task Name": name, 
  "Average Time (ps)": result?.mean * 1000,
  "Variance (ps)": result?.variance * 1000 
})));
