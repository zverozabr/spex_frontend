export const BlockTypes = {
  resource: 'resource',
  job: 'job',
};

const Blocks = {
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
