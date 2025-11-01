import { Anchor, Button, Group, PasswordInput, Stack, TextInput, Drawer } from '@mantine/core';
import { IsAuth } from 'src/user/component/isauth';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useGlobalStore } from 'src/main/hooks/hooks';
import { userLogin, userRegister, type LoginRequest, type RegisterRequestWritable } from 'src/lib/api';
import { setProfile } from 'src/user/store/utils';

export const AuthDrawer = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const isSmallScreen = useMediaQuery('(max-width: 765px)');
  return (
    <Drawer
      position="right"
      size={isSmallScreen ? '100%' : 'md'}
      opened={opened}
      onClose={onClose}
      title="Authentication"
    >
      <AuthenticationForm close={onClose} />
    </Drawer>
  );
};

function AuthenticationForm({ close }) {
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
    try {
      const { data } = await userLogin({ body });
      userStore.login(body);
      setProfile(data);
      close();
    } catch (error: any) {
      if (error.detail)
        form.setErrors({
          username: error.detail,
          password: error.detail,
        });
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (body: RegisterRequestWritable) => {
    setLoading(true);

    try {
      await userRegister({ body });
      toggle();
      notifications.show({
        id: 'register',
        position: 'bottom-right',
        message: "Welcome to Raviolichess — you're in!",
        color: 'cyan.4',
        autoClose: 4000,
      });
    } catch (err: any) {
      console.error(err);
      form.setErrors(err);
    } finally {
      setLoading(false);
    }
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

export const LoginButton = ({ onClick }: { onClick: () => void }) => {
  const isSmallScreen = useMediaQuery('(max-width: 765px)');
  const screenProps = isSmallScreen
    ? { variant: 'transparent', color: 'white' }
    : { variant: 'filled', color: 'cyan' };

  return (
    <IsAuth showIf={false}>
      <Button {...screenProps} onClick={onClick}>
        Log in
      </Button>
    </IsAuth>
  );
};
