
  # Event Calendar View

  This is a code bundle for Event Calendar View. The original project is available at https://www.figma.com/design/oHZ6rWT4tqVgepzoxDTx9i/Event-Calendar-View.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Deployment

  This project is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

  ### GitHub Pages Setup

  To enable GitHub Pages deployment for your repository:

  1. Go to your repository settings on GitHub
  2. Navigate to **Pages** in the left sidebar
  3. Under **Source**, select **GitHub Actions**
  4. Push to the `main` branch to trigger the deployment

  The site will be available at: `https://<your-username>.github.io/icarnatic/`

  ### Manual Deployment

  You can also trigger the deployment manually:
  1. Go to the **Actions** tab in your repository
  2. Select the "Deploy to GitHub Pages" workflow
  3. Click "Run workflow"

  -----

# Notes

Arch:
1. scraper can be run on aws lambda
2. store data on s3 / supabase.com
3. run a small ec2 with nginx loadbalancing
4. use ECS to scale it. Automate ec2 using terraform