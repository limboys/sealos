import useOverviewStore from '@/stores/overview';
import clander_icon from '@/assert/clander.svg';
import {
  Flex,
  Input,
  Popover,
  PopoverTrigger,
  Img,
  PopoverContent,
  Button,
  Box
} from '@chakra-ui/react';
import { format, parse, isValid, isAfter, isBefore, endOfDay, startOfDay, addDays } from 'date-fns';
import { useState, ChangeEventHandler } from 'react';
import { DateRange, SelectRangeEventHandler, DayPicker } from 'react-day-picker';

export default function SelectRange({ isDisabled }: { isDisabled: boolean | undefined }) {
  let { startTime, endTime } = useOverviewStore();
  const setStartTime = useOverviewStore((state) => state.setStartTime);
  const setEndTime = useOverviewStore((state) => state.setEndTime);

  const initState = { from: startTime, to: endTime };
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(initState);
  const [fromValue, setFromValue] = useState<string>(format(initState.from, 'y-MM-dd'));
  const [toValue, setToValue] = useState<string>(format(initState.to, 'y-MM-dd'));
  const [inputState, setInputState] = useState<0 | 1>(0);
  const onClose = () => {
    selectedRange?.from && setStartTime(startOfDay(selectedRange.from));
    selectedRange?.to && setEndTime(endOfDay(selectedRange.to));
  };
  const handleFromChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFromValue(e.target.value);
    const date = parse(e.target.value, 'y-MM-dd', new Date());
    if (!isValid(date)) {
      return setSelectedRange({ from: undefined, to: selectedRange?.to });
    }

    if (selectedRange?.to) {
      if (isAfter(date, selectedRange.to)) {
        setSelectedRange({ from: selectedRange.to, to: date });
      } else {
        setSelectedRange({ from: date, to: selectedRange?.to });
      }
    } else {
      setSelectedRange({ from: date, to: date });
    }
  };

  const handleToChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setToValue(e.target.value);
    const date = parse(e.target.value, 'y-MM-dd', new Date());

    if (!isValid(date)) {
      return setSelectedRange({ from: selectedRange?.from, to: undefined });
    }
    if (selectedRange?.from) {
      if (isBefore(date, selectedRange.from)) {
        setSelectedRange({ from: date, to: selectedRange.from });
      } else {
        setSelectedRange({ from: selectedRange?.from, to: date });
      }
    } else {
      setSelectedRange({ from: date, to: date });
    }
  };

  const handleRangeSelect: SelectRangeEventHandler = (range: DateRange | undefined) => {
    if (range) {
      let { from, to } = range;
      if (inputState === 0) {
        // 输入from
        if (from === selectedRange?.from) {
          // 组件动了to
          from = to;
        } else {
          to = from;
        }
        setInputState(1);
      } else {
        setInputState(0);
      }
      setSelectedRange({
        from,
        to
      });
      if (from) {
        setFromValue(format(from, 'y-MM-dd'));
      } else {
        setFromValue('');
      }
      if (to) {
        setToValue(format(to, 'y-MM-dd'));
      } else {
        setToValue(from ? format(from, 'y-MM-dd') : '');
      }
    } else {
      // 选了第一个日期，组件默认的行为是取消选择
      if (fromValue && selectedRange?.from) {
        setToValue(fromValue);
        setSelectedRange({
          ...selectedRange,
          to: selectedRange.from
        });
        setInputState(1);
      }
    }
  };
  const handleRangeSelectFrom: SelectRangeEventHandler = (range: DateRange | undefined) => {
    if (range) {
      let { from, to } = range;
      if (selectedRange?.to) {
        if (from) {
          if (!to) {
            // 证明直接重合
            to = from;
          } else if (from === selectedRange?.from) {
            // 组件动了to
            from = to;
            to = selectedRange.to;
          }
          if (isBefore(from, selectedRange.to)) {
            setSelectedRange({
              ...selectedRange,
              from
            });
            setFromValue(format(from, 'y-MM-dd'));
          }
        }
      }
    }
  };
  const handleRangeSelectTo: SelectRangeEventHandler = (range: DateRange | undefined) => {
    console.log(range, selectedRange);
    if (range) {
      let { from, to } = range;
      if (selectedRange?.from) {
        if (to) {
          if (!from) {
            // 证明直接重合
            from = to;
          } else if (to === selectedRange?.to) {
            // 组件动了from
            to = from;
            from = selectedRange.from;
          }
          if (isAfter(to, selectedRange.from)) {
            setSelectedRange({
              ...selectedRange,
              to
            });
            setToValue(format(to, 'y-MM-dd'));
          }
        }
      }
    } else {
      // 选了第一个日期，组件默认的行为是取消选择
      if (fromValue && selectedRange?.from) {
        setToValue(fromValue);
        setSelectedRange({
          ...selectedRange,
          to: selectedRange.from
        });
        setInputState(1);
      }
    }
  };
  return (
    <Flex
      w={'280px'}
      h={'32px'}
      bg="#F6F8F9"
      mr={'32px'}
      gap={'12px'}
      align={'center'}
      px={'12px'}
      justify={'space-between'}
      border={'1px solid #DEE0E2'}
      borderRadius="2px"
    >
      <Popover onClose={onClose}>
        <PopoverTrigger>
          <Button display={'flex'} variant={'unstyled'} isDisabled={isDisabled}>
            <Input
              isDisabled={!!isDisabled}
              variant={'unstyled'}
              flex={1}
              value={fromValue}
              minW="90px"
              onChange={handleFromChange}
              onBlur={() => {
                selectedRange?.from && setStartTime(startOfDay(selectedRange.from));
                console.log(selectedRange?.from);
              }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent zIndex={99}>
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelectFrom}
            defaultMonth={startTime}
            styles={{
              day: {
                borderRadius: 'unset',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          />
        </PopoverContent>
      </Popover>
      <Box>-</Box>

      <Popover onClose={onClose}>
        <PopoverTrigger>
          <Button display={'flex'} variant={'unstyled'} isDisabled={isDisabled}>
            <Input
              isDisabled={!!isDisabled}
              variant={'unstyled'}
              value={toValue}
              flex={1}
              minW="90px"
              onChange={handleToChange}
              onBlur={() => {
                selectedRange?.to && setEndTime(endOfDay(selectedRange.to));
                console.log(selectedRange?.to);
              }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent zIndex={99}>
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelectTo}
            defaultMonth={endTime}
            styles={{
              day: {
                borderRadius: 'unset',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          />
        </PopoverContent>
      </Popover>
      <Popover
        onClose={() => {
          setInputState(0);
          onClose();
        }}
      >
        <PopoverTrigger>
          <Button display={'flex'} variant={'unstyled'} isDisabled={isDisabled}>
            <Img src={clander_icon.src}></Img>
          </Button>
        </PopoverTrigger>
        <PopoverContent zIndex={99}>
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelect}
            styles={{
              day: {
                borderRadius: 'unset',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </Flex>
  );
}
