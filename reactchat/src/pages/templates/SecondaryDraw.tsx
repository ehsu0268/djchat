import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/////
import useAxiosWithInterceptor from "../../helpers/jwtinterceptor";
/////

type SecondaryDrawProps = {
  children: React.ReactNode;
};

const SecondaryDraw = ({ children }: SecondaryDrawProps) => {
  const theme = useTheme();
  const jwtAxios = useAxiosWithInterceptor();

  jwtAxios
    .get("http://localhost:8000/api/server/select/?category=cat1")
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });

  return (
    <Box
      sx={{
        minWidth: `${theme.secondaryDraw.width}px`,
        height: `calc(100vh - ${theme.primaryAppBar.height}px )`,
        mt: `${theme.primaryAppBar.height}px`,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: {
          xs: "none",
          sm: "block",
        },
        overflow: "auto",
      }}
    >
      {children}
    </Box>
  );
};

export default SecondaryDraw;
