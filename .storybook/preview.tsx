import type { Preview } from '@storybook/react-vite'
import { Box, Button } from '@mui/material'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    // Append a submit button to any story that exposes a `formId` arg, so the
    // form can be submitted and its payload logged to the Actions panel.
    // Opt out per-story/meta with `parameters: { formSubmit: false }`.
    (Story, context) => {
      const formId = context.args.formId as string | undefined;
      if (!formId || context.parameters.formSubmit === false) {
        return <Story />;
      }
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <Story />
          <Button type="submit" form={formId} variant="contained">
            Submit
          </Button>
        </Box>
      );
    },
  ],
};

export default preview;
