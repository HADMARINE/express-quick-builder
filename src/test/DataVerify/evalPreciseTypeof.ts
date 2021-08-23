import { preciseTypeof } from '../../index';

function Root() {
  console.log(preciseTypeof('hello world'));
  console.log(preciseTypeof(1));
  console.log(preciseTypeof(null));
  console.log(preciseTypeof(undefined));
  console.log(preciseTypeof({ hello: 'wrld' }));
  console.log([1, 2, 3, 4]);
  console.log(new Date());
  console.log(true);
  console.log(() => 1);
}

export default Root();
