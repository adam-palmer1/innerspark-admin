# InnerSpark Admin Panel

A React-based administrative interface for managing the InnerSpark API.

## Features

- **Authentication**: Secure JWT-based admin login
- **Admin Management**: Create, read, update, and manage admin users
- **Affirmation Management**: Full CRUD operations for affirmations with filtering and bulk operations
- **Analytics Dashboard**: View statistics and insights about platform usage
- **Responsive Design**: Modern Material-UI components with mobile support

## Technology Stack

- **React 18** with TypeScript
- **Material-UI v5** for UI components
- **React Router v6** for navigation
- **Axios** for API communication
- **Context API** for state management

## Configuration

### Environment Variables

The application can be configured using the following environment variables in `.env`:

```bash
# Server Configuration
HOST=0.0.0.0                    # Listen IP address
PORT=3000                       # Listen port

# API Configuration  
REACT_APP_API_BASE_URL=https://api.innerspark.app  # InnerSpark API endpoint

# Development Settings
GENERATE_SOURCEMAP=false        # Disable source maps in production
BROWSER=none                    # Don't auto-open browser
```

### API Configuration

The application connects to the InnerSpark API using the `REACT_APP_API_BASE_URL` environment variable. If not specified, it defaults to `https://api.innerspark.app`.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
