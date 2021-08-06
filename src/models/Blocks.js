export const BlockTypes = {
  base: 'base',
  job: 'job',
};

const Blocks = {
  box: {
    type: BlockTypes.base,
    label: 'Box',
    description: 'Description for Box block',
    input: '-',
    output: '-',
  },
  task: {
    type: BlockTypes.base,
    label: 'Task',
    description: 'Description for Task block',
    input: '-',
    output: '-',
  },
  resource: {
    type: BlockTypes.base,
    label: 'Resource',
    description: 'Description for Resource block',
    input: '-',
    output: '-',
  },
  segmentation: {
    type: BlockTypes.job,
    label: 'Segmentation',
    description: 'Description for segmentation block',
    input: '-',
    output: '-',
  },
};

Object.keys(Blocks).forEach((key) => {
  Blocks[key].value = key;
});

export default Blocks;
