import { useHTMLData, usePageStore } from 'src/main/hooks/hooks';
import { Combobox, useCombobox } from '@mantine/core';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconChessRook } from '@tabler/icons-react';
import { useMemo } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import styles from 'src/common/css/icon.module.css';

export const Positions = observer(({ ttposition }) => {
  const analyseStore = usePageStore();
  const { positions } = useHTMLData();

  const options = useMemo(
    () =>
      positions.map(item => (
        <Combobox.Option value={item.fen} key={item.fen}>
          {[item.eco, item.name].join(' ')}
        </Combobox.Option>
      )),
    [positions],
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
        onOptionSubmit={action(fen => {
          if (true) {
            analyseStore.reload(fen);
          }
          combobox.closeDropdown();
        })}
      >
        <Combobox.Target>
          <Tooltip label="select position" position={ttposition} color="gray" withArrow>
            <ActionIcon className={styles.icon} onClick={() => combobox.toggleDropdown()}>
              <IconChessRook stroke={1.2}></IconChessRook>
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
