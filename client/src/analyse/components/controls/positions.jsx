import { useInitData, useModule } from 'src/shared/hooks/hooks';
import { Combobox, useCombobox } from '@mantine/core';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconChessRook } from '@tabler/icons-react';
import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';

export const Positions = observer(() => {
  const module = useModule();
  const positions = useInitData();

  const options = useMemo(
    () =>
      positions.map((item) => (
        <Combobox.Option value={item.fen} key={item.fen}>
          {[item.eco, item.name].join(' ')}
        </Combobox.Option>
      )),
    [positions]
  );

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  return (
    <>
      <Combobox
        store={combobox}
        width={200}
        position="top"
        withinPortal={false}
        onOptionSubmit={(fen) => {
          if (fen != module.fen.current) {
            module.newGame?.(fen);
            module.board.position(fen, true);
            module.fen.setFen(fen);
          }
          combobox.closeDropdown();
        }}>
        <Combobox.Target>
          <Tooltip label="select position" position="bottom">
            <ActionIcon
              variant="default"
              size="sm"
              onClick={() => combobox.toggleDropdown()}
              styles={{
                root: { border: 0 },
              }}>
              <IconChessRook size={40} stroke={1.2}></IconChessRook>
            </ActionIcon>
          </Tooltip>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
});
