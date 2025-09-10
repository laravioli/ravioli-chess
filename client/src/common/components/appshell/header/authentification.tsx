import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo } from 'react';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useStore } from 'src/main/hooks/hooks';

export function AuthenticationForm({ close }) {
  const { userStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [type, toggle] = useToggle(['login', 'register']);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
      email: '',
    },

    validate: {
      username: (val) => null,
      email: (val) =>
        /^\S+@\S+$/.test(val) || type === 'login' ? null : 'Invalid email',
      password: (val) =>
        val.length <= 4
          ? 'Password should include at least 4 characters'
          : null,
    },
  });

  const handlers = useMemo(
    () =>
      new Map([
        ['login', userStore.login.bind(userStore)],
        ['register', userStore.register.bind(userStore)],
      ]),
    []
  );

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await handlers.get(type)(values);
      if (type === 'register') {
        toggle();
        notifications.show({
          id: 'register',
          position: 'bottom-right',
          message: "Welcome to Raviolichess — you're in!",
          color: 'cyan.4',
          autoClose: 4000,
        });
      }
      if (type === 'login') close();
    } catch (error) {
      if (error.data) {
        if (type == 'register')
          form.setErrors({
            username: error.data.username?.[0] ?? null,
            email: error.data.email?.[0] ?? null,
          });

        if (type === 'login') {
          form.setErrors({
            username: error.data.detail,
            password: error.data.detail,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        {type === 'register' && (
          <TextInput
            required
            label="Email"
            placeholder="ravioli@chess.com"
            key={form.key('email')}
            {...form.getInputProps('email')}
            radius="md"
          />
        )}

        <TextInput
          label="Username"
          placeholder="Your username"
          key={form.key('username')}
          {...form.getInputProps('username')}
          radius="md"
        />

        <PasswordInput
          required
          label="Password"
          placeholder="Your password"
          key={form.key('password')}
          {...form.getInputProps('password')}
          radius="md"
        />
      </Stack>

      <Group justify="space-between" mt="xl">
        <Anchor
          component="button"
          type="button"
          c="dimmed"
          onClick={() => {
            form.clearErrors();
            toggle();
          }}
          size="xs">
          {type === 'register'
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </Anchor>
        <Button type="submit" radius="xl" loading={loading}>
          {upperFirst(type)}
        </Button>
      </Group>
    </form>
  );
}
