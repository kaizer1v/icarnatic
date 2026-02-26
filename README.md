
  # Event Calendar View

  This is a code bundle for Event Calendar View. The original project is available at https://www.figma.com/design/oHZ6rWT4tqVgepzoxDTx9i/Event-Calendar-View.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
  -----

# Notes

Arch:
1. scraper can be run on aws lambda
2. store data on s3 / supabase.com
3. run a small ec2 with nginx loadbalancing
4. use ECS to scale it. Automate ec2 using terraform