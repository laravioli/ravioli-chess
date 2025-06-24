import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useStore } from 'src/main/hooks/hooks';

export function AuthenticationForm() {
  const { userStore } = useStore();
  const [type, toggle] = useToggle(['login', 'register']);

  const onSubmit = async (values) => {
    const handlers = new Map([
      ['login', userStore.login.bind(userStore)],
      ['register', userStore.register.bind(userStore)],
    ]);
    const message = await handlers.get(type)(values);
    console.log(message);
  };
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
      email: '',
    },

    validate: {
      email: (val) =>
        /^\S+@\S+$/.test(val) || type === 'login' ? null : 'Invalid email',
      password: (val) =>
        val.length <= 4
          ? 'Password should include at least 4 characters'
          : null,
    },
  });

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
          onClick={() => toggle()}
          size="xs">
          {type === 'register'
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </Anchor>
        <Button type="submit" radius="xl">
          {upperFirst(type)}
        </Button>
      </Group>
    </form>
  );
}
