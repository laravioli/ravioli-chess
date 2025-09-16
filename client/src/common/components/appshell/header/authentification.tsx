import { Anchor, Button, Group, PasswordInput, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useGlobalStore } from 'src/main/hooks/hooks';
import { userLogin, userRegister, type LoginRequest, type RegisterRequestWritable } from 'src/lib/api';

export function AuthenticationForm({ close }) {
  const { userStore } = useGlobalStore();
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
      username: _ => null,
      email: val => (/^\S+@\S+$/.test(val) || type === 'login' ? null : 'Invalid email'),
      password: val => (val.length <= 4 ? 'Password should include at least 4 characters' : null),
    },
  });

  const onLogin = async (body: LoginRequest) => {
    setLoading(true);
    const { error } = await userLogin({
      body,
    });
    if (error) {
      form.setErrors({
        username: error.detail,
        password: error.detail,
      });
    } else {
      userStore.login(body);
      close();
    }
    setLoading(false);
  };

  const onRegister = async (body: RegisterRequestWritable) => {
    setLoading(true);
    const { error } = await userRegister({ body });
    if (error) {
      form.setErrors(error as any);
      setLoading(false);
      return;
    }
    toggle();
    notifications.show({
      id: 'register',
      position: 'bottom-right',
      message: "Welcome to Raviolichess — you're in!",
      color: 'cyan.4',
      autoClose: 4000,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={form.onSubmit(type === 'login' ? onLogin : onRegister)}>
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
          size="xs"
        >
          {type === 'register' ? 'Already have an account? Login' : "Don't have an account? Register"}
        </Anchor>
        <Button type="submit" radius="xl" loading={loading}>
          {upperFirst(type)}
        </Button>
      </Group>
    </form>
  );
}
