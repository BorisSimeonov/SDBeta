<?php

$myfile = fopen("scores", "r") or die("Unable to open file!");
if(filesize("scores") > 0) {
	echo fread($myfile,filesize("scores"));
}
fclose($myfile);
die;