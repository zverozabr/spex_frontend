import { FormControlLabel as Label } from '@material-ui/core';
import { TextField as Input, Checkbox, Radio, Select } from 'final-form-material-ui';
import { Form, Field } from 'react-final-form';

import FormRenderer from './components/FormRenderer';
import Validators from './utils/Validators';

const Controls = {
  Label,
  Input,
  Checkbox,
  Radio,
  Select,
};

export {
  Form as default,
  Field,
  FormRenderer,
  Controls,
  Validators,
};
