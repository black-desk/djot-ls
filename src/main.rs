use djot_ls::djot::render_to_string;
use jotdown;

#[must_use]
pub fn jotdown_parse(djot: &str) -> String {
    render_to_string(jotdown::Parser::new(djot))
}

fn main() {
    println!("{}", jotdown_parse("Hello, *world*!"));
}
